import { DataSource } from 'typeorm';
import { Quiz } from './quiz/quiz.entity';
import { Participant } from './participant/participant.entity';

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'quiz.db',
  entities: [Quiz, Participant],
  synchronize: true,
});

const quizzes: Array<{ question: string; options: string[]; answers: number[]; times: number }> = [
  {
    question: "À quelle heure ouvre votre pharmacie ?",
    options: ["07h00", "07h15", "07h30", "08h00"],
    answers: [2],
    times: 30,
  },
  {
    question: "En quelle année la pharmacie a-t-elle ouvert ses portes ?",
    options: ["2017", "2018", "2019", "2020", "2021"],
    answers: [2],
    times: 30,
  },
  {
    question: "Citez 3 employés de la pharmacie ayant au moins 3 ans d'ancienneté",
    options: ["Ange", "Raïssa", "Rachida", "Josée", "Dominique", "Serge"],
    answers: [1, 2, 5],
    times: 45,
  },
  {
    question: "Quels sont les différents moyens de paiement acceptés à la pharmacie ?",
    options: ["Orange Money", "Moov money", "Wave", "Espèces", "Carte bancaire"],
    answers: [0, 2],
    times: 30,
  },
  {
    question: "Citez un test rapide que nous faisons à la pharmacie ?",
    options: ["Paludisme", "Dengue", "Glycémie", "Test sanguin"],
    answers: [0, 1, 2],
    times: 30,
  },
  {
    question: "Citer 3 assurances qui passent à la pharmacie Val d'Oise ?",
    options: ["Mci", "Mugefci", "Mupemenet", "Ankara", "Cie"],
    answers: [0, 1, 3],
    times: 45,
  },
  {
    question: "Quels sont les services gratuits à la pharmacie Val d'Oise ?",
    options: ["Test de Palu", "Prise de tension", "Dermoanalyse", "Keito"],
    answers: [1, 2, 3],
    times: 30,
  },
  {
    question: "Citez le nom de 3 employés de la pharmacie Val d'Oise ?",
    options: ["Kapemin", "Patrick", "Delphine", "Djakaridja", "Annick"],
    answers: [0, 2, 3, 4],
    times: 45,
  },
  {
    question: "Combien d'hommes y a-t-il au sein de l'équipe officinale de Val d'Oise ?",
    options: ["1", "2", "3", "4"],
    answers: [3],
    times: 30,
  },
  {
    question: "Citez nous le nom d'un Pharmacien assistant",
    options: ["Dr Yao", "Dr Zoh", "Dr Kichiedou", "Dr Aka", "Dr Gauze", "Dr Taïba", "Dr Dindji"],
    answers: [1, 2, 4, 5, 6],
    times: 30,
  },
  {
    question: "Combien y a-t-il de caisses au sein de la Pharmacie ?",
    options: ["2", "3", "4", "5"],
    answers: [3],
    times: 30,
  },
  {
    question: "Quelles sont les codes couleurs de la pharmacie ?",
    options: ["Vert blanc gris", "Vert blanc jaune", "Orange blanc vert"],
    answers: [0],
    times: 30,
  },
  {
    question: "Donnez le nom du 1er pharmacien assistant de la pharmacie Val d'Oise",
    options: ["Dr Kichiedou", "Dr Kouadio", "Dr Dindji"],
    answers: [1],
    times: 30,
  },
  {
    question: "La pharmacie Val d'Oise possède combien d'employés ?",
    options: ["Plus de 20 employés", "Plus de 30 employés", "Plus de 40 employés"],
    answers: [2],
    times: 30,
  },
  {
    question: "Quelle est la meilleure collaboratrice de l'année 2025 ?",
    options: ["Jocelyne", "Donatella", "Gisèle"],
    answers: [2],
    times: 30,
  },
  {
    question: "En quelle année avons-nous obtenu le prix du meilleur accueil des pharmacies de la Côte d'Ivoire ?",
    options: ["2024", "2025", "2026"],
    answers: [1],
    times: 30,
  },
  {
    question: "Le piercing est-il payant ou gratuit à la pharmacie Val d'Oise ?",
    options: ["Payant", "Gratuit"],
    answers: [1],
    times: 20,
  },
  {
    question: "Donnez un numéro sur lequel joindre la pharmacie Val d'Oise",
    options: ["0707006666", "0707006767", "0700003737"],
    answers: [0, 2],
    times: 30,
  },
  {
    question: "Quel est le nom de la responsable de la satisfaction clientèle de la pharmacie Val d'Oise ?",
    options: ["Bénédicte", "Laurence", "Clarisse", "Alima"],
    answers: [2],
    times: 30,
  },
  {
    question: "Citez le nom d'une conseillère de la parapharmacie de Val d'Oise",
    options: ["Christelle", "Bénédicte", "Rachida", "Marlène", "Annick", "Mamouna"],
    answers: [1, 2, 4, 5],
    times: 45,
  },
  {
    question: "Combien de pharmaciens sont à disposition de la clientèle pour une meilleure prise en charge ?",
    options: ["2", "3", "4", "5"],
    answers: [3],
    times: 30,
  },
];

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Quiz);

  const count = await repo.count();
  if (count > 0) {
    console.log(`Base déjà peuplée (${count} quiz). Suppression et rechargement...`);
    await repo.clear();
  }

  for (const q of quizzes) {
    await repo.save(repo.create(q));
  }

  console.log(`${quizzes.length} quiz chargés avec succès !`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Erreur lors du seed:', err);
  process.exit(1);
});
