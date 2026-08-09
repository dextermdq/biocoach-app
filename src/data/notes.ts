export type Note = { title: string; body: string; accent: 'pine' | 'terracotta' | 'blue' | 'plum' };

export const NOTES: Note[] = [
  {
    title: 'Comida (la palanca real)',
    accent: 'terracotta',
    body:
      'Recomposición: déficit leve (300–400 kcal menos) + proteína alta, ~130–160 g por día. Así se baja panza y se gana músculo a la vez. ' +
      'En déficit el volumen llega más lento; cuando estés más fino, comé un poco de más para priorizar tamaño. ' +
      'Mitad del plato proteína y verdura; cortar azúcar líquido y picoteo nocturno.',
  },
  {
    title: 'Para que crezca el músculo',
    accent: 'pine',
    body:
      'Subir el peso o las repeticiones con el tiempo. Por eso el registro de pesos es clave: sin progresión, el músculo no crece.',
  },
  {
    title: 'Sobre los abdominales',
    accent: 'terracotta',
    body:
      'Los ejercicios de abs fortalecen y marcan el músculo, pero no queman la grasa de la panza. Eso lo hace el déficit. ' +
      'Se ven cuando baja la grasa de encima.',
  },
  {
    title: 'Camino a correr',
    accent: 'blue',
    body:
      'Las caminatas son la base de la capacidad torácica. Cuando 40 min sean fáciles, sumá intervalos ' +
      '(1 min trote / 2 min caminata) antes de correr seguido.',
  },
  {
    title: 'Aguante',
    accent: 'plum',
    body:
      'El Kegel nocturno es la base; sumá 2–3 veces por semana la práctica de "parar y arrancar". ' +
      'La medicación indicada por el médico es un apoyo puntual; el trabajo de suelo pélvico y respiración es lo que cambia la base. ' +
      'Cualquier duda con la medicación, consultá al médico.',
  },
];
