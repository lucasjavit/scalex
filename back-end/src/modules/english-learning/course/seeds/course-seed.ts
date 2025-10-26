import { DataSource } from 'typeorm';
import { Stage } from '../entities/stage.entity';
import { Unit } from '../entities/unit.entity';
import { Card } from '../entities/card.entity';

export async function seedCourseData(dataSource: DataSource) {
  const stagesRepository = dataSource.getRepository(Stage);
  const unitsRepository = dataSource.getRepository(Unit);
  const cardsRepository = dataSource.getRepository(Card);

  console.log('Seeding English Course data...');

  // Check if data already exists
  const existingStages = await stagesRepository.count();
  if (existingStages > 0) {
    console.log('Course data already exists, skipping seed...');
    return;
  }

  // Create Stages
  const stage1 = stagesRepository.create({
    title: 'Beginner',
    description: 'Learn the basics of English',
    orderIndex: 1,
  });

  const stage2 = stagesRepository.create({
    title: 'Intermediate',
    description: 'Improve your English skills',
    orderIndex: 2,
  });

  const stage3 = stagesRepository.create({
    title: 'Advanced',
    description: 'Master advanced English concepts',
    orderIndex: 3,
  });

  await stagesRepository.save([stage1, stage2, stage3]);
  console.log('✓ Created 3 stages');

  // Create Units for Stage 1 (Beginner)
  const unit1 = unitsRepository.create({
    stageId: stage1.id,
    title: 'Greetings and Introductions',
    description: 'Learn how to greet people and introduce yourself',
    orderIndex: 1,
    youtubeUrl: 'https://www.youtube.com/watch?v=7kjCPPSLiD8',
    videoDuration: 600, // 10 minutes
  });

  const unit2 = unitsRepository.create({
    stageId: stage1.id,
    title: 'Numbers and Alphabet',
    description: 'Learn numbers from 1-100 and the English alphabet',
    orderIndex: 2,
    youtubeUrl: 'https://www.youtube.com/watch?v=v4FC7wbmTWk',
    videoDuration: 480, // 8 minutes
  });

  const unit3 = unitsRepository.create({
    stageId: stage1.id,
    title: 'Common Phrases',
    description: 'Learn everyday English phrases',
    orderIndex: 3,
    youtubeUrl: 'https://www.youtube.com/watch?v=Kbs1bq-jpxQ',
    videoDuration: 720, // 12 minutes
  });

  await unitsRepository.save([unit1, unit2, unit3]);
  console.log('✓ Created 3 units for Stage 1');

  // Create Units for Stage 2 (Intermediate)
  const unit4 = unitsRepository.create({
    stageId: stage2.id,
    title: 'Present Perfect Tense',
    description: 'Master the present perfect tense',
    orderIndex: 1,
    youtubeUrl: 'https://www.youtube.com/watch?v=hX-NlYSrMh8',
    videoDuration: 540, // 9 minutes
  });

  const unit5 = unitsRepository.create({
    stageId: stage2.id,
    title: 'Phrasal Verbs',
    description: 'Learn common phrasal verbs',
    orderIndex: 2,
    youtubeUrl: 'https://www.youtube.com/watch?v=wOlS2S_qpgg',
    videoDuration: 660, // 11 minutes
  });

  await unitsRepository.save([unit4, unit5]);
  console.log('✓ Created 2 units for Stage 2');

  // Create Units for Stage 3 (Advanced)
  const unit6 = unitsRepository.create({
    stageId: stage3.id,
    title: 'Business English',
    description: 'Learn professional English for business',
    orderIndex: 1,
    youtubeUrl: 'https://www.youtube.com/watch?v=czhY3xYDRlc',
    videoDuration: 900, // 15 minutes
  });

  await unitsRepository.save([unit6]);
  console.log('✓ Created 1 unit for Stage 3');

  // Create Cards for Unit 1 (Greetings)
  const cards1 = [
    {
      unitId: unit1.id,
      question: 'Como se diz "Olá" em inglês?',
      answer: 'Hello',
      exampleSentence: 'Hello, how are you?',
      orderIndex: 1,
    },
    {
      unitId: unit1.id,
      question: 'Como se diz "Bom dia" em inglês?',
      answer: 'Good morning',
      exampleSentence: 'Good morning! Did you sleep well?',
      orderIndex: 2,
    },
    {
      unitId: unit1.id,
      question: 'Como se diz "Prazer em conhecê-lo" em inglês?',
      answer: 'Nice to meet you',
      exampleSentence: 'Nice to meet you! My name is John.',
      orderIndex: 3,
    },
    {
      unitId: unit1.id,
      question: 'Como se diz "Como vai?" em inglês?',
      answer: 'How are you?',
      exampleSentence: 'Hi Sarah! How are you doing today?',
      orderIndex: 4,
    },
    {
      unitId: unit1.id,
      question: 'Como se diz "Tchau" em inglês?',
      answer: 'Goodbye',
      exampleSentence: 'Goodbye! See you tomorrow.',
      orderIndex: 5,
    },
  ];

  await cardsRepository.save(cards1.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 5 cards for Unit 1');

  // Create Cards for Unit 2 (Numbers)
  const cards2 = [
    {
      unitId: unit2.id,
      question: 'Como se diz o número "1" em inglês?',
      answer: 'One',
      exampleSentence: 'I have one apple.',
      orderIndex: 1,
    },
    {
      unitId: unit2.id,
      question: 'Como se diz o número "10" em inglês?',
      answer: 'Ten',
      exampleSentence: 'There are ten students in the class.',
      orderIndex: 2,
    },
    {
      unitId: unit2.id,
      question: 'Como se diz o número "20" em inglês?',
      answer: 'Twenty',
      exampleSentence: 'I am twenty years old.',
      orderIndex: 3,
    },
    {
      unitId: unit2.id,
      question: 'Como se diz o número "100" em inglês?',
      answer: 'One hundred',
      exampleSentence: 'This book has one hundred pages.',
      orderIndex: 4,
    },
  ];

  await cardsRepository.save(cards2.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 4 cards for Unit 2');

  // Create Cards for Unit 3 (Common Phrases)
  const cards3 = [
    {
      unitId: unit3.id,
      question: 'Como se diz "Por favor" em inglês?',
      answer: 'Please',
      exampleSentence: 'Can you help me, please?',
      orderIndex: 1,
    },
    {
      unitId: unit3.id,
      question: 'Como se diz "Obrigado" em inglês?',
      answer: 'Thank you',
      exampleSentence: 'Thank you for your help!',
      orderIndex: 2,
    },
    {
      unitId: unit3.id,
      question: 'Como se diz "De nada" em inglês?',
      answer: 'You\'re welcome',
      exampleSentence: 'You\'re welcome! Anytime.',
      orderIndex: 3,
    },
    {
      unitId: unit3.id,
      question: 'Como se diz "Desculpe" em inglês?',
      answer: 'Sorry / Excuse me',
      exampleSentence: 'Sorry, I didn\'t mean to interrupt.',
      orderIndex: 4,
    },
    {
      unitId: unit3.id,
      question: 'Como se diz "Com licença" em inglês?',
      answer: 'Excuse me',
      exampleSentence: 'Excuse me, where is the bathroom?',
      orderIndex: 5,
    },
  ];

  await cardsRepository.save(cards3.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 5 cards for Unit 3');

  // Create Cards for Unit 4 (Present Perfect)
  const cards4 = [
    {
      unitId: unit4.id,
      question: 'Complete: I ____ (visit) Paris three times.',
      answer: 'have visited',
      exampleSentence: 'I have visited Paris three times.',
      orderIndex: 1,
    },
    {
      unitId: unit4.id,
      question: 'Complete: She ____ (not finish) her homework yet.',
      answer: 'hasn\'t finished',
      exampleSentence: 'She hasn\'t finished her homework yet.',
      orderIndex: 2,
    },
    {
      unitId: unit4.id,
      question: 'Complete: ____ you ever ____ (eat) sushi?',
      answer: 'Have / eaten',
      exampleSentence: 'Have you ever eaten sushi?',
      orderIndex: 3,
    },
  ];

  await cardsRepository.save(cards4.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 3 cards for Unit 4');

  // Create Cards for Unit 5 (Phrasal Verbs)
  const cards5 = [
    {
      unitId: unit5.id,
      question: 'O que significa "give up"?',
      answer: 'Desistir',
      exampleSentence: 'Don\'t give up on your dreams!',
      orderIndex: 1,
    },
    {
      unitId: unit5.id,
      question: 'O que significa "look after"?',
      answer: 'Cuidar de',
      exampleSentence: 'Can you look after my cat this weekend?',
      orderIndex: 2,
    },
    {
      unitId: unit5.id,
      question: 'O que significa "turn on"?',
      answer: 'Ligar (aparelho)',
      exampleSentence: 'Please turn on the lights.',
      orderIndex: 3,
    },
    {
      unitId: unit5.id,
      question: 'O que significa "turn off"?',
      answer: 'Desligar (aparelho)',
      exampleSentence: 'Don\'t forget to turn off the TV.',
      orderIndex: 4,
    },
  ];

  await cardsRepository.save(cards5.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 4 cards for Unit 5');

  // Create Cards for Unit 6 (Business English)
  const cards6 = [
    {
      unitId: unit6.id,
      question: 'Como se diz "reunião" em inglês?',
      answer: 'Meeting',
      exampleSentence: 'We have a meeting at 3 PM.',
      orderIndex: 1,
    },
    {
      unitId: unit6.id,
      question: 'Como se diz "prazo" em inglês?',
      answer: 'Deadline',
      exampleSentence: 'The deadline for this project is Friday.',
      orderIndex: 2,
    },
    {
      unitId: unit6.id,
      question: 'Como se diz "acordo" em inglês?',
      answer: 'Agreement / Deal',
      exampleSentence: 'We reached an agreement with the client.',
      orderIndex: 3,
    },
  ];

  await cardsRepository.save(cards6.map((c) => cardsRepository.create(c)));
  console.log('✓ Created 3 cards for Unit 6');

  console.log('✅ Course data seeded successfully!');
  console.log(`Total: 3 stages, 6 units, 27 cards`);
}
