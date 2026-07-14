import { Controller, Get, Post, Body, Param, Query, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QuizService } from './quiz.service.js';
import { ParticipantService } from '../participant/participant.service.js';
import { ParticipationService } from '../participation/participation.service.js';
import { SettingsService } from '../settings/settings.service.js';

const TOTAL_NUMBERS = 25;

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
  registerPage(@Query('quota') quota?: string) {
    return {
      quotaMessage: quota ? 'Vous avez atteint votre quota du jour. Revenez demain pour continuer à jouer !' : null,
    };
  }

  @Post('register')
  async register(
    @Body() body: { name: string; phone: string },
    @Res() res: Response,
  ) {
    let participant = await this.participantService.findByPhone(body.phone);
    if (participant) {
      participant.name = body.name;
      await this.participantService.save(participant);
    } else {
      participant = await this.participantService.create(body.name, body.phone);
    }

    res.redirect(`/quiz/board/${participant.id}`);
  }

  @Get('board/:participantId')
  async board(
    @Param('participantId') participantId: string,
    @Res() res: Response,
  ) {
    const pid = parseInt(participantId, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) {
      res.redirect('/quiz');
      return;
    }

    const dailyQuota = await this.settingsService.getDailyQuota();
    const todayCount = await this.participationService.countToday(pid);

    if (todayCount >= dailyQuota) {
      res.redirect('/quiz?quota=1');
      return;
    }

    const numbers: { number: number; answered: boolean }[] = [];
    for (let i = 0; i < TOTAL_NUMBERS; i++) {
      numbers.push({
        number: i + 1,
        answered: participant.answeredNumbers.includes(i),
      });
    }

    res.render('quiz/board', {
      participant,
      numbers,
      remaining: dailyQuota - todayCount,
      dailyQuota,
    });
  }

  @Get('play/:participantId/:number')
  async play(
    @Param('participantId') participantId: string,
    @Param('number') number: string,
    @Res() res: Response,
  ) {
    const pid = parseInt(participantId, 10);
    const num = parseInt(number, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) { res.render('quiz/play', { error: 'Participant non trouvé' }); return; }

    if (num < 0 || num >= TOTAL_NUMBERS) { res.render('quiz/play', { error: 'Numéro invalide' }); return; }

    const dailyQuota = await this.settingsService.getDailyQuota();
    const todayCount = await this.participationService.countToday(pid);
    if (todayCount >= dailyQuota) {
      res.redirect('/quiz?quota=1');
      return;
    }

    if (participant.answeredNumbers.includes(num)) {
      res.render('quiz/play', { alreadyAnswered: true, participant, number: num + 1 });
      return;
    }

    const quizzes = await this.quizService.findAll();
    if (quizzes.length === 0) { res.render('quiz/play', { error: 'Aucun quiz disponible' }); return; }
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    res.render('quiz/play', {
      quiz,
      participant,
      number: num + 1,
      numberIndex: num,
    });
  }

  @Post('answer/:participantId/:number')
  async answer(
    @Param('participantId') participantId: string,
    @Param('number') number: string,
    @Body() body: { selected: number[]; quizId: number },
    @Res() res: Response,
  ) {
    const pid = parseInt(participantId, 10);
    const num = parseInt(number, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) {
      res.json({ error: true });
      return;
    }

    const quiz = await this.quizService.findOne(body.quizId);
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

    const dailyQuota = await this.settingsService.getDailyQuota();
    const todayCount = await this.participationService.countToday(pid);

    res.json({
      correct: isCorrect,
      correctAnswers: quiz.answers,
      selected,
      quotaExceeded: todayCount >= dailyQuota,
    });
  }
}
