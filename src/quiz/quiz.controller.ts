import { Controller, Get, Post, Body, Param, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QuizService } from './quiz.service.js';
import { ParticipantService } from '../participant/participant.service.js';
import { ParticipationService } from '../participation/participation.service.js';
import { SettingsService } from '../settings/settings.service.js';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly participantService: ParticipantService,
    private readonly participationService: ParticipationService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  @Render('quiz/register')
  registerPage() {
    return {};
  }

  @Post('register')
  async register(
    @Body() body: { name: string; phone: string },
    @Res() res: Response,
  ) {
    const quizzes = await this.quizService.findAll();
    const quizOrder = shuffle(quizzes.map((q) => q.id));

    let participant = await this.participantService.findByPhone(body.phone);
    if (participant) {
      participant.name = body.name;
      participant.quizOrder = quizOrder;
      participant.answeredNumbers = [];
      await this.participantService.save(participant);
    } else {
      participant = await this.participantService.create(body.name, body.phone, quizOrder);
    }

    res.redirect(`/quiz/board/${participant.id}`);
  }

  @Get('board/:participantId')
  @Render('quiz/board')
  async board(@Param('participantId') participantId: string) {
    const pid = parseInt(participantId, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) return { error: 'Participant non trouvé' };

    const dailyQuota = await this.settingsService.getDailyQuota();
    const todayCount = await this.participationService.countToday(pid);

    if (todayCount >= dailyQuota) {
      return { quotaExceeded: true, participant, dailyQuota };
    }

    const totalNumbers = participant.quizOrder.length;
    const numbers: { number: number; answered: boolean }[] = [];
    for (let i = 0; i < totalNumbers; i++) {
      numbers.push({
        number: i + 1,
        answered: participant.answeredNumbers.includes(i),
      });
    }

    return {
      participant,
      numbers,
      totalNumbers,
      remaining: dailyQuota - todayCount,
      dailyQuota,
    };
  }

  @Get('play/:participantId/:number')
  @Render('quiz/play')
  async play(
    @Param('participantId') participantId: string,
    @Param('number') number: string,
  ) {
    const pid = parseInt(participantId, 10);
    const num = parseInt(number, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) return { error: 'Participant non trouvé' };

    const dailyQuota = await this.settingsService.getDailyQuota();
    const todayCount = await this.participationService.countToday(pid);
    if (todayCount >= dailyQuota) {
      return { quotaExceeded: true, participant };
    }

    const quizId = participant.quizOrder[num];
    if (quizId === undefined) return { error: 'Numéro invalide' };

    if (participant.answeredNumbers.includes(num)) {
      return { alreadyAnswered: true, participant, number: num + 1 };
    }

    const quiz = await this.quizService.findOne(quizId);
    if (!quiz) return { error: 'Quiz non trouvé' };

    return {
      quiz,
      participant,
      number: num + 1,
      numberIndex: num,
    };
  }

  @Post('answer/:participantId/:number')
  async answer(
    @Param('participantId') participantId: string,
    @Param('number') number: string,
    @Body() body: { selected: number[] },
    @Res() res: Response,
  ) {
    const pid = parseInt(participantId, 10);
    const num = parseInt(number, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) {
      res.json({ error: true });
      return;
    }

    const quizId = participant.quizOrder[num];
    const quiz = await this.quizService.findOne(quizId);
    if (!quiz) {
      res.json({ error: true });
      return;
    }

    const selected = Array.isArray(body.selected) ? body.selected.map(Number) : [];

    const isCorrect =
      selected.length === quiz.answers.length &&
      selected.every((s) => quiz.answers.includes(s));

    await this.participantService.markAnswered(pid, num, isCorrect);

    await this.participationService.create({
      participantId: pid,
      participantName: participant.name,
      participantPhone: participant.phone,
      quizId: quiz.id,
      quizQuestion: quiz.question,
      correct: isCorrect,
    });

    res.json({
      correct: isCorrect,
      correctAnswers: quiz.answers,
      selected,
    });
  }
}
