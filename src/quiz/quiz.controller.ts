import { Controller, Get, Post, Body, Param, Render, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { QuizService } from './quiz.service.js';
import { ParticipantService } from '../participant/participant.service.js';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly participantService: ParticipantService,
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
    const participant = await this.participantService.create(body.name, body.phone);
    res.redirect(`/quiz/play/${participant.id}/0`);
  }

  @Get('play/:participantId/:index')
  @Render('quiz/play')
  async play(
    @Param('participantId') participantId: string,
    @Param('index') index: string,
  ) {
    const pid = parseInt(participantId, 10);
    const idx = parseInt(index, 10);
    const participant = await this.participantService.findOne(pid);
    const quizzes = await this.quizService.findAll();

    if (!participant) return { error: 'Participant non trouvé' };
    if (idx >= quizzes.length) {
      return {
        finished: true,
        participant,
        total: quizzes.length,
      };
    }

    const quiz = quizzes[idx];
    return {
      quiz,
      quizJson: JSON.stringify(quiz),
      participant,
      currentIndex: idx,
      totalQuizzes: quizzes.length,
      nextIndex: idx + 1,
    };
  }

  @Post('answer/:participantId/:index')
  async answer(
    @Param('participantId') participantId: string,
    @Param('index') index: string,
    @Body() body: { selected: string | string[] },
    @Res() res: Response,
  ) {
    const pid = parseInt(participantId, 10);
    const idx = parseInt(index, 10);
    const participant = await this.participantService.findOne(pid);
    const quizzes = await this.quizService.findAll();

    if (!participant || idx >= quizzes.length) {
      res.redirect('/quiz');
      return;
    }

    const quiz = quizzes[idx];
    const selected = Array.isArray(body.selected)
      ? body.selected.map(Number)
      : body.selected
        ? [Number(body.selected)]
        : [];

    const isCorrect =
      selected.length === quiz.answers.length &&
      selected.every((s) => quiz.answers.includes(s));

    if (isCorrect) {
      await this.participantService.updateScore(pid, participant.score + 1, idx + 1);
    } else {
      await this.participantService.updateScore(pid, participant.score, idx + 1);
    }

    res.json({
      correct: isCorrect,
      correctAnswers: quiz.answers,
      selected,
    });
  }

  @Get('results/:participantId')
  @Render('quiz/results')
  async results(@Param('participantId') participantId: string) {
    const pid = parseInt(participantId, 10);
    const participant = await this.participantService.findOne(pid);
    const quizzes = await this.quizService.findAll();
    return { participant, total: quizzes.length };
  }
}
