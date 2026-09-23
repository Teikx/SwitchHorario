import { AvatarOption, PopularGame, Player, HouseRule } from './types';

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'mario', name: 'Mario', emoji: '🍄', bgColor: '#FF3C28' },
  { id: 'luigi', name: 'Luigi', emoji: '🟢', bgColor: '#10E364' },
  { id: 'peach', name: 'Peach', emoji: '👑', bgColor: '#FF69B4' },
  { id: 'bowser', name: 'Bowser', emoji: '🔥', bgColor: '#FF7B00' },
  { id: 'yoshi', name: 'Yoshi', emoji: '🦖', bgColor: '#70E000' },
  { id: 'toad', name: 'Toad', emoji: '🍄‍🟫', bgColor: '#00C3E3' },
  { id: 'link', name: 'Link', emoji: '🗡️', bgColor: '#00B4D8' },
  { id: 'zelda', name: 'Zelda', emoji: '✨', bgColor: '#C77DFF' },
  { id: 'kirby', name: 'Kirby', emoji: '⭐️', bgColor: '#FF85A1' },
  { id: 'pikachu', name: 'Pikachu', emoji: '⚡️', bgColor: '#FFD60A' },
  { id: 'donkeykong', name: 'DK', emoji: '🍌', bgColor: '#8A5A36' },
  { id: 'wario', name: 'Wario', emoji: '💰', bgColor: '#E6FF00' },
];

export const PLAYER_COLORS = [
  { name: 'Rojo Neón (Joy-Con)', hex: '#FF3C28' },
  { name: 'Azul Neón (Joy-Con)', hex: '#00C3E3' },
  { name: 'Verde Neón', hex: '#10E364' },
  { name: 'Rosa Neón', hex: '#FF69B4' },
  { name: 'Amarillo Neón', hex: '#FFD60A' },
  { name: 'Púrpura Galaxia', hex: '#9D4EDD' },
  { name: 'Naranja Fuego', hex: '#FF7B00' },
  { name: 'Cian Hielo', hex: '#48CAE4' },
];

export const POPULAR_GAMES: PopularGame[] = [
  { id: 'mario-kart', title: 'Mario Kart 8 Deluxe', icon: '🏎️', color: '#FF3C28' },
  { id: 'smash-bros', title: 'Super Smash Bros. Ultimate', icon: '🥊', color: '#00C3E3' },
  { id: 'zelda-totk', title: 'Zelda: Tears of the Kingdom', icon: '🗡️', color: '#00B4D8' },
  { id: 'mario-wonder', title: 'Super Mario Bros. Wonder', icon: '🐘', color: '#FF5400' },
  { id: 'pokemon', title: 'Pokémon Scarlet / Violet', icon: '⚡️', color: '#FFD60A' },
  { id: 'animal-crossing', title: 'Animal Crossing: New Horizons', icon: '🏝️', color: '#52B788' },
  { id: 'mario-party', title: 'Mario Party Superstars', icon: '🎲', color: '#E0AAFF' },
  { id: 'minecraft', title: 'Minecraft', icon: '⛏️', color: '#6B705C' },
  { id: 'splatoon', title: 'Splatoon 3', icon: '🦑', color: '#F72585' },
  { id: 'sports', title: 'Nintendo Switch Sports', icon: '🎾', color: '#4CC9F0' },
  { id: 'fifa', title: 'EA Sports FC / FIFA', icon: '⚽️', color: '#2B9348' },
  { id: 'otro', title: 'Otro juego...', icon: '🎮', color: '#9D4EDD' },
];

export const DEFAULT_PLAYERS: Player[] = [
  { id: 'p-1', name: 'Carlos', avatar: 'mario', color: '#FF3C28', pin_hash: '1234' },
  { id: 'p-2', name: 'Mateo', avatar: 'luigi', color: '#10E364', pin_hash: '1234' },
  { id: 'p-3', name: 'Lucía', avatar: 'peach', color: '#FF69B4', pin_hash: '1234' },
  { id: 'p-4', name: 'Santi', avatar: 'link', color: '#00C3E3', pin_hash: '1234' },
];

export const HOUSE_RULES: HouseRule[] = [
  {
    id: 'r1',
    title: 'Límite de tiempo por turno',
    description: 'Máximo 2 horas seguidas por primo. Si nadie más reservó después, puedes extender tu turno.',
    icon: '⏱️',
  },
  {
    id: 'r2',
    title: 'Si terminas antes, libera la consola',
    description: 'Presiona "Liberar Switch" en la app para que otro primo pueda empezar a jugar sin esperar.',
    icon: '🚀',
  },
  {
    id: 'r3',
    title: 'Cuidado de los Joy-Cons y batería',
    description: 'Pon a cargar los Joy-Cons y la Switch al terminar. Cero comida grasosa ni líquidos cerca de la consola.',
    icon: '🔋',
  },
  {
    id: 'r4',
    title: 'Respetar el calendario de turnos',
    description: 'Si alguien tiene reservado a las 5:00 PM, a las 4:59 PM debes guardar tu partida y entregar el control.',
    icon: '🤝',
  },
];
