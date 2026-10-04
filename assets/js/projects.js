// Project data for the grid. Edit this file to add, reorder or retag games.
//
//   title    — shown on the card
//   meta     — one-line genre / format description
//   genre    — one of GENRES below; drives the filter buttons
//   status   — optional ("In development", "In Internal Testing", …)
//   image    — optional cover art (assets/img/projects/…). Square icons are
//              shown as an app tile on a blurred backdrop; wide art fills the cover.
//   about    — optional longer description, shown in the details dialog
//   links    — optional store / demo links { label, url }
//   featured — true makes the card span two columns on wide screens

export const GENRES = ['Multiplayer', 'Educational', 'Hyper-casual', 'Simulation', 'Arcade & Puzzle'];

const IMG = 'assets/img/projects/';

export const projects = [
  {
    title: 'Just Different Experience', meta: '3D open-world multiplayer platformer', genre: 'Multiplayer',
    status: 'In development', featured: true, image: IMG + 'just_different_experience.jpg',
    about: 'An open-world, third-person multiplayer platformer I\'m leading at Meta Frolic Labs, built on Mirror Networking and Nakama. The goal: climb upward and reach the final destination at the very top.',
  },
  {
    title: 'Spades With Friends', meta: '2D multiplayer board game', genre: 'Multiplayer',
    image: IMG + 'spades_with_friends.png',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.spadeswithfriendsllc.spadesgame' },
    ],
  },
  {
    title: 'Gravity Bottle Flip', meta: '2D casual platformer · physics', genre: 'Hyper-casual',
    featured: true, image: IMG + 'gravity_bottle_flip.jpg',
    about: 'A physics-based bottle-flip game built from scratch at Absolutely Digital — custom flip dynamics, landing detection and level progression.',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.absolutelydigital.gravitybottleflip&hl=en' },
      { label: 'App Store', url: 'https://apps.apple.com/us/app/gravity-bottle-flip/id6738737240' },
    ],
  },
  {
    title: 'OctoThink', meta: '2D brain training · educational', genre: 'Educational',
    image: IMG + 'octothink.jpg',
    about: 'Designed and built The Link, Dot Trail and Sliced Food mini-games for the OctoThink brain-training app.',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.absolutelydigital.octothink&hl=en' },
    ],
  },
  {
    title: 'Ray Flex: In A Murky Space', meta: 'Educational · reflection & refraction (research)', genre: 'Educational',
    featured: true, image: IMG + 'ray_flex.jpg',
    about: 'My MS thesis game: teaches Class X physics (reflection and refraction) through play, aligned with standard textbook chapters.',
    links: [
      { label: 'itch.io', url: 'https://osamasarfraz.itch.io/ray-flex-in-a-murky-space' },
    ],
  },
  {
    title: 'DAL-CAL', meta: 'Word-morphing multiplayer game', genre: 'Multiplayer',
    image: IMG + 'dal_cal.png',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/pk/app/dal-cal/id6748467559' },
    ],
  },
  {
    title: 'Hammy\'s Cosmic Wheel', meta: 'Arcade survival · game jam', genre: 'Arcade & Puzzle',
    featured: true, image: IMG + 'hammys_cosmic_wheel.jpg',
    about: 'My entry to The Very Serious Juniper Dev Game Jam, built just before joining Meta Frolic Labs: help Hammy spin the planetary orbits and win the cosmic race while dodging the strange obstacles floating through space. Playable in the browser.',
    links: [
      { label: 'itch.io', url: 'https://osamasarfraz.itch.io/hammys-cosmic-wheel' },
    ],
  },
  {
    title: '9-No Draw', meta: 'Domino-based multiplayer board game', genre: 'Multiplayer',
    status: 'In Internal Testing', image: IMG + 'nine_no_draw.png',
  },
  {
    title: 'Defend The Dice', meta: '3D puzzle · dice-based strategy', genre: 'Arcade & Puzzle',
    featured: true, image: IMG + 'defend_the_dice.jpg',
    about: 'A personal 3D puzzle-strategy game where every move is a dice roll you have to defend. Built solo in Unity and released on itch.io.',
    links: [
      { label: 'itch.io', url: 'https://osamasarfraz.itch.io/defend-the-dice' },
    ],
  },
  {
    title: 'Clown Town', meta: 'Top-down multiplayer battle arena', genre: 'Multiplayer',
    status: 'In Internal Testing',
  },
  {
    title: 'Boosting Blenders', meta: 'Children\'s educational game', genre: 'Educational',
    status: 'In Internal Testing',
  },
  {
    title: 'Pocket Shop', meta: 'Japanese-style visual novel · 2D racing', genre: 'Simulation',
    status: 'In Internal Testing', image: IMG + 'pocket_shop.jpg',
    about: 'A Japanese-style visual novel with a garage and inventory-management loop, broken up by 2D drag races. Built at ePlanet Global.',
  },
  {
    title: 'Dubbs Games', meta: 'Casino games · web', genre: 'Multiplayer',
    links: [
      { label: 'dubbsgames.com', url: 'https://www.dubbsgames.com' },
    ],
  },
  {
    title: 'ASMR Hospital Doctor', meta: '2D idle · simulation', genre: 'Simulation',
    image: IMG + 'asmr_hospital_doctor.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.playnation.asmr.satisfying.doctor.games&hl=en&gl=US' },
      { label: 'App Store', url: 'https://apps.apple.com/pk/app/asmr-hospital-doctor-games/id1643497401' },
    ],
  },
  {
    title: 'Dentist Inc.', meta: '3D hyper-casual', genre: 'Hyper-casual',
    image: IMG + 'dentist_inc.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.taprix.dentist.hospital.inc.doctor.games&hl=en_US' },
      { label: 'App Store', url: 'https://apps.apple.com/pk/app/dentist-hospital-doctor-games/id1618914291' },
    ],
  },
  {
    title: 'Super Stylist Nail Salon', meta: '3D nail art · makeover simulation', genre: 'Simulation',
    image: IMG + 'nail_salon.png',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/us/app/super-stylist-nail-salon-games/id1630169097' },
    ],
  },
  {
    title: 'Surgery Doctor Simulator', meta: '2D idle · simulation', genre: 'Simulation',
    image: IMG + 'surgery_doctor_simulator.jpg',
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.taprix.er.emergency.hospital.surgery.simulator.doctor.games&hl=en&gl=US' },
    ],
  },
  {
    title: 'Perfect Smash Inc.', meta: '3D hyper-casual', genre: 'Hyper-casual',
    image: IMG + 'perfect_smash_inc.jpg',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/us/app/perfect-smash-inc/id1491310769' },
    ],
  },
  {
    title: 'Ray Of Hope', meta: '3D hyper-casual', genre: 'Hyper-casual',
    image: IMG + 'ray_of_hope.jpg',
    links: [
      { label: 'YouTube demo', url: 'https://www.youtube.com/watch?v=rOxSa7hD_8o' },
    ],
  },
  {
    title: 'Toy Run', meta: '3D hyper-casual', genre: 'Hyper-casual',
    status: 'Taken down from stores',
  },
  {
    title: 'Extreme Traffic Police Bike', meta: '3D racing', genre: 'Arcade & Puzzle',
    image: IMG + 'extreme_traffic_police_bike.jpg',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/us/app/extreme-traffic-police-bike/id1117836268' },
    ],
  },
  {
    title: 'Miners.IO', meta: '2D idle · top-down', genre: 'Simulation',
    image: IMG + 'miners_io.jpg',
    links: [
      { label: 'YouTube demo', url: 'https://www.youtube.com/watch?v=DrKKEIgzWFM&feature=youtu.be' },
    ],
  },
];
