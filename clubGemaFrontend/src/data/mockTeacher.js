export const teacherData = {
  stats: [
    { title: "Clases Hoy", value: "3", color: "blue" },
    { title: "Alumnos Total", value: "45", color: "green" },
    { title: "Asistencia Promedio", value: "92%", color: "purple" },
  ],
  classes: [
    { 
      id: 1, 
      title: "Fundamentos Sub-12", 
      time: "16:00 - 17:30", 
      court: "Cancha 1", 
      level: "Principiante",
      totalStudents: 12,
      attended: null, // null = no se ha tomado lista
      students: [
        { id: 101, name: "Sofía M.", status: "present" },
        { id: 102, name: "Mateo R.", status: "present" },
        { id: 103, name: "Valentina C.", status: "absent" },
        { id: 104, name: "Lucas P.", status: "present" },
        { id: 105, name: "Camila S.", status: "late" },
      ]
    },
    { 
      id: 2, 
      title: "Selección Mayores", 
      time: "18:00 - 20:00", 
      court: "Coliseo Central", 
      level: "Avanzado",
      totalStudents: 15,
      attended: true, // Ya se tomó lista
      students: [] // (Datos simulados vacíos para no alargar)
    },
    { 
      id: 3, 
      title: "Táctica Defensiva", 
      time: "20:00 - 21:30", 
      court: "Cancha 2", 
      level: "Intermedio",
      totalStudents: 18,
      attended: null,
      students: [] 
    }
  ]
};