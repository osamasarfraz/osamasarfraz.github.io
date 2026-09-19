// Project data for the 3D gallery. Mirrors the "Selected Projects" section of
// the current site (index.html) so the prototype shows real content.

const IMG = 'assets/img/projects/';

export const projects = [
  {
    title: 'Just Different Experience', meta: '3D Multiplayer Platformer', status: 'In development',
    cover: 'climb',
    about: 'An open-world, third-person multiplayer platformer I\'m building at Meta Frolic Labs. '
      + 'The goal: climb upward and reach the final destination at the very top.',
  },
  { title: 'Boosting Blenders', meta: 'Children Educational Game', status: 'In Internal Testing' },
  { title: '9-No Draw', meta: 'Domino-based Multiplayer Board Game', status: 'In Internal Testing' },
  {
    title: 'DAL-CAL', meta: 'Word Morphing Multiplayer Game',
    links: [{ label: 'App Store', url: 'https://apps.apple.com/pk/app/dal-cal/id6748467559' }],
  },
  {
    title: 'Spades With Friends', meta: '2D Board Multiplayer Game', image: IMG + 'spades_with_friends.png',
    links: [{ label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.spadeswithfriendsllc.spadesgame' }],
  },
  { title: 'Pocket Shop', meta: 'Visual Novel + Inventory Management / 2D Car Racing', status: 'In Internal Testing' },
  { title: 'Clown Town', meta: 'Top-Down Multiplayer Battle', status: 'In Internal Testing' },
  {
    title: 'Dubbs Games', meta: 'Casino Games',
    links: [{ label: 'dubbsgames.com', url: 'https://www.dubbsgames.com' }],
  },
  {
    title: 'OctoThink', meta: '2D Brain Training / Educational', image: IMG + 'octothink.jpg',
    links: [{ label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.absolutelydigital.octothink&hl=en' }],
  },
  {
    title: 'Gravity Bottle Flip', meta: '2D Casual Platformer / Physics', image: IMG + 'gravity_bottle_flip.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.absolutelydigital.gravitybottleflip&hl=en' },
      { label: 'App Store', url: 'https://apps.apple.com/us/app/gravity-bottle-flip/id6738737240' },
    ],
  },
  {
    title: 'ASMR Hospital Doctor', meta: '2D Idle / Simulation', image: IMG + 'asmr_hospital_doctor.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.playnation.asmr.satisfying.doctor.games&hl=en&gl=US' },
      { label: 'App Store', url: 'https://apps.apple.com/pk/app/asmr-hospital-doctor-games/id1643497401' },
    ],
  },
  {
    title: 'Dentist Inc.', meta: '3D Hyper Casual', image: IMG + 'dentist_inc.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.taprix.dentist.hospital.inc.doctor.games&hl=en_US' },
      { label: 'App Store', url: 'https://apps.apple.com/pk/app/dentist-hospital-doctor-games/id1618914291' },
    ],
  },
  {
    title: 'Surgery Doctor Simulator', meta: '2D Idle / Simulation', image: IMG + 'surgery_doctor_simulator.jpg',
    links: [{ label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.taprix.er.emergency.hospital.surgery.simulator.doctor.games&hl=en&gl=US' }],
  },
  {
    title: 'Perfect Smash Inc.', meta: '3D Hyper Casual', image: IMG + 'perfect_smash_inc.jpg',
    links: [{ label: 'App Store', url: 'https://apps.apple.com/us/app/perfect-smash-inc/id1491310769' }],
  },
  { title: 'Toy Run', meta: '3D Hyper Casual', status: 'Taken down from stores' },
  {
    title: 'Ray Of Hope', meta: '3D Hyper Casual', image: IMG + 'ray_of_hope.jpg',
    links: [{ label: 'YouTube demo', url: 'https://www.youtube.com/watch?v=rOxSa7hD_8o' }],
  },
  {
    title: 'Extreme Traffic Police Bike', meta: '3D Racing', image: IMG + 'extreme_traffic_police_bike.jpg',
    links: [{ label: 'App Store', url: 'https://apps.apple.com/us/app/extreme-traffic-police-bike/id1117836268' }],
  },
  {
    title: 'Miners.IO', meta: '2D Idle / Top Down', image: IMG + 'miners_io.jpg',
    links: [{ label: 'YouTube demo', url: 'https://www.youtube.com/watch?v=DrKKEIgzWFM&feature=youtu.be' }],
  },
  {
    title: 'Ray Flex: In A Murky Space', meta: 'Educational · Reflection & Refraction (Research)', image: IMG + 'ray_flex.jpg',
    links: [{ label: 'itch.io', url: 'https://osamasarfraz.itch.io/ray-flex-in-a-murky-space' }],
  },
  {
    title: 'Defend The Dice', meta: '3D Puzzle · Dice-based strategy', image: IMG + 'defend_the_dice.jpg',
    links: [{ label: 'itch.io', url: 'https://osamasarfraz.itch.io/defend-the-dice' }],
  },
];
