import prisma from '../prismaClient.js'

const moviesData = [
  {
    id: 1,
    title: 'Põgenev mees',
    description:
      'Miljonid jahivad. Üks põgeneb. Kõik vaatavad. Põnev ulmepõnevik põhineb Stephen Kingi romaanil.',
    durationMin: 133,
    basePrice: 9.5,
    genre: 'Märul, Ulmefilm, Thriller',
    length: '2h 13min',
    language: 'Eesti / Inglise, subtiitrid',
    posterSmall:
      'https://images.markus.live/mcswebsites.blob.core.windows.net/1013/Event_9644/portrait_medium/RUNNINGMAN_600x900.png?width=270&height=405&format=jpg&quality=90',
    banner:
      'https://images.markus.live/mcswebsites.blob.core.windows.net/1013/Event_9644/landscape_billboard_wide/RunningMan_3840x750.png?width=1920&height=375&format=jpg&quality=90',
    trailer: 'https://www.youtube.com/embed/ThWT4XwUcug'
  },
  {
    id: 2,
    title: 'The Glassworker',
    description:
      'Lüüriline animatsioonifilm noorest klaasipuhujast ja tema lapsepõlvesõbrast sõja taustal.',
    durationMin: 90,
    basePrice: 8.0,
    genre: 'Animatsioon, Draama',
    length: '1h 30min',
    language: 'Inglise',
    posterSmall:
      'https://m.media-amazon.com/images/M/MV5BMjM0MjU5M2MtZjAxOC00YTM0LTlkNWQtMDE3NTE1Y2JiMTJlXkEyXkFqcGc@._V1_.jpg',
    banner:
      'https://images.squarespace-cdn.com/content/v1/5a6b77fa96e76f3e8a3c7518/1621938647269-37A1J8EU6KD32MIBVQ3X/TheGlassworker_banner.jpg?format=1500w',
    trailer: 'https://www.youtube.com/embed/gn2o3shXU8U'
  }
]

async function main() {
  console.log('Start seeding movies ...')

  for (const movie of moviesData) {
    const created = await prisma.movie.upsert({
      where: { id: movie.id },
      update: movie,
      create: movie
    })
    console.log(`Upserted movie with id: ${created.id} (${created.title})`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })