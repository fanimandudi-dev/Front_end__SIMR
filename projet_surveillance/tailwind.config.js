/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{html,ts}'];
export const theme = {
  extend: {
    colors: {
      primaire: '#0f172a', // Bleu nuit très moderne
      secondaire: '#3b82f6', // Bleu clair
      alerte: '#ef4444', // Rouge pour les clusters
      succes: '#22c55e', // Vert pour les fiches validées
    },
  },
};
export const plugins = [];
