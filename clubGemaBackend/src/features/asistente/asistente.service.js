import { GoogleGenerativeAI } from '@google/generative-ai';
import { asistenciaService } from '../asistencia/asistencia.service.js';

// Inicializamos Gemini con el API KEY generado
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const obtenerFechaLocal = (fecha) => {
    const f = new Date(fecha);
    const anio = f.getFullYear();
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    const dia = String(f.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`
}

const diasSemana = (dia) => {
    let nombreDia;
    switch (dia) {
        case 1: nombreDia = 'Lunes';
            break;
        case 2: nombreDia = 'Martes';
            break;
        case 3: nombreDia = 'Miércoles';
            break;
        case 4: nombreDia = 'Jueves';
            break;
        case 5: nombreDia = 'Viernes';
            break;
        case 6: nombreDia = 'Sábado';
            break;
        case 7: nombreDia = 'Domingo';
            break;
        default: return "Nro de día inválido";
    }
    return nombreDia;
}

export const asistenteService = {
    procesarComandoVoz: async (texto, userId, rol) => {
        if (!texto) {
            return res.status(400).json({ success: false, message: "No se proporcionó texto." });
        }

        // Configuramos el modelo de IA y hacemos que el response sea un JSON
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
          Eres el motor de procesamiento de lenguaje natural del sistema de gestión "Club Gema".
          El usuario ha dicho lo siguiente por voz: "${texto}"
          El rol del usuario es: "${rol}"

          Tu tarea es analizar el texto y extraer la intención del usuario y cualquier parámetro relevante.
          DEBES responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
          {
            "intencion": "VER_CLASES" | "VER_PAGOS_PENDIENTES" | "VER_RECAUDACION" | "DESCONOCIDA",
            "parametros": {
              "fecha": "hoy" | "semana" | "mes" | null,
              "mes": "nombre del mes si lo menciona" | null
            },
          }
        `;

        const result = await model.generateContent(prompt);
        const iaResponseText = result.response.text();
        const iaData = JSON.parse(iaResponseText);

        console.log("🧠 Análisis de IA:", iaData);

        // const iaData = {
        //     intencion: 'VER_CLASES',
        //     parametros: {
        //         fecha: 'hoy',
        //         mes: null,
        //     }
        // }

        let respuesta = "No pude entender tu consulta. Por favor, intenta de nuevo.";
        if (iaData.intencion.includes('VER_CLASES')) {
            const clases = await asistenciaService.obtenerPorAlumno(userId);
            const hoyString = obtenerFechaLocal(new Date());
            const clasesFechas = clases.map(c => {
                return {
                    ...c,
                    fechaClase: c.fecha.toISOString().split('T')[0]
                }
            });
            if (iaData.parametros.fecha.includes('hoy')) {
                const clasesHoy = clasesFechas.filter(cf => cf.fechaClase === hoyString);
                if (clasesHoy.length === 0) {
                    respuesta = "No tienes ninguna clase programada para el día de hoy";
                } else {
                    const sedeClase = clasesHoy[0].inscripciones.horarios_clases.canchas.sedes.nombre;
                    const horaInicioClase = clasesHoy[0].inscripciones.horarios_clases.hora_inicio.toISOString().substring(11, 16);
                    const horaFinClase = clasesHoy[0].inscripciones.horarios_clases.hora_fin.toISOString().substring(11, 16);
                    if (clasesHoy.length === 1) {
                        respuesta = `Tienes una clase hoy de ${horaInicioClase} pm a ${horaFinClase} pm en la sede ${sedeClase}.`;
                    } else {
                        respuesta = `Tienes ${clasesHoy.length} clases en la sede ${sedeClase} el dia de hoy. La primera empieza a las ${horaInicioClase} pm hasta las ${horaFinClase} pm.`;
                    }
                }
                console.log(respuesta)
            }
            if (iaData.parametros.fecha.includes('semana')) {
                const hoy = new Date(hoyString);
                hoy.setUTCHours(0, 0, 0, 0)
                const inicioSemana = new Date(hoy);
                inicioSemana.setUTCDate(hoy.getUTCDate() - (hoy.getUTCDay() + 6) % 7);
                const finSemana = new Date(inicioSemana);
                finSemana.setUTCDate(inicioSemana.getUTCDate() + 6);
                finSemana.setUTCHours(23, 59, 59, 999)
                const clasesSemana = clasesFechas.filter(cf => {
                    return cf.fecha.getTime() >= inicioSemana.getTime() && cf.fecha.getTime() <= finSemana.getTime()
                })
                if (clasesSemana.length === 0) {
                    respuesta = "No tienes ninguna clase programada para esta semana"
                } else {
                    const sedeClase = clasesSemana[0].inscripciones.horarios_clases.canchas.sedes.nombre;
                    const horaInicioClase = clasesSemana[0].inscripciones.horarios_clases.hora_inicio.toISOString().substring(11, 16);
                    const horaFinClase = clasesSemana[0].inscripciones.horarios_clases.hora_fin.toISOString().substring(11, 16);
                    if (clasesSemana.length === 1) {
                        const nroDiaClase = clasesSemana[0].inscripciones.horarios_clases.dia_semana;
                        const nombreDiaClase = diasSemana(nroDiaClase);
                        respuesta = `Tienes una clase programada para el día ${nombreDiaClase} de ${horaInicioClase} pm a ${horaFinClase} pm en la sede ${sedeClase}.`;
                    } else {
                        const nrosDiasClases = clasesSemana.map(ch => ch.inscripciones.horarios_clases.dia_semana);
                        const nombresDiasClases = [...new Set(nrosDiasClases.map(diasSemana))];
                        respuesta = `Tienes ${clasesSemana.length} clases en la sede ${sedeClase} esta semana. Los días que debes asistir son: ${nombresDiasClases.join(', ')}`;
                    }
                }
                console.log(respuesta)
            }
            if (iaData.parametros.fecha.includes('mes')) {
                const hoy = new Date(hoyString);
                const clasesMes = clasesFechas.filter(cf => cf.fecha.getMonth() === hoy.getMonth())
                if (clasesMes.length === 0) {
                    respuesta = "No tienes ninguna clase programada para este mes"
                } else {
                    const sedeClase = clasesMes[0].inscripciones.horarios_clases.canchas.sedes.nombre;
                    const horaInicioClase = clasesMes[0].inscripciones.horarios_clases.hora_inicio.toISOString().substring(11, 16);
                    const horaFinClase = clasesMes[0].inscripciones.horarios_clases.hora_fin.toISOString().substring(11, 16);
                    if (clasesMes.length === 1) {
                        const fechaClase = clasesMes[0].fecha;
                        respuesta = `Tienes una clase programada para el ${fechaClase} de ${horaInicioClase} pm a ${horaFinClase} pm en la sede ${sedeClase}.`;
                    } else {
                        const fechasClases = clasesMes.map(cm => {
                            cm.fecha.setUTCHours(cm.fecha.getUTCHours() + 5);
                            return obtenerFechaLocal(cm.fecha)
                        })
                        respuesta = `Tienes ${clasesMes.length} clases en la sede ${sedeClase} este mes. Las fechas que debes asistir son: ${fechasClases.join(', ')}`;
                    }
                }
                console.log(respuesta)
            }
            return {
                intencion: iaData.intencion,
                parametros: {
                    fecha: iaData.parametros.fecha,
                    mes: iaData.parametros.mes,
                },
                respuesta: respuesta,
            }
        }
    }
}