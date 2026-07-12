import { Controller, Get, Post, Body, Param, Render, Redirect, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QuizService } from '../quiz/quiz.service.js';
import { ParticipantService } from '../participant/participant.service.js';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly quizService: QuizService,
    private readonly participantService: ParticipantService,
  ) {}

  @Get()
  @Render('admin/index')
  async index() {
    const quizzes = await this.quizService.findAll();
    const participants = await this.participantService.findAll();
    return { quizzes, participants };
  }

  @Get('create')
  @Render('admin/create')
  createForm() {
    return {};
  }

  @Post('create')
  async create(
    @Body() body: { question: string; options: string; answers: string; times: string },
    @Res() res: Response,
  ) {
    const options = body.options.split('\n').map((o) => o.trim()).filter(Boolean);
    const answers = body.answers.split(',').map((a) => parseInt(a.trim(), 10));
    const times = parseInt(body.times, 10) || 30;
    await this.quizService.create({ question: body.question, options, answers, times });
    res.redirect('/admin');
  }

  @Get('edit/:id')
  @Render('admin/edit')
  async editForm(@Param('id') id: string) {
    const quiz = await this.quizService.findOne(parseInt(id, 10));
    if (!quiz) return { error: 'Quiz non trouvé' };
    return {
      quiz: {
        ...quiz,
        optionsText: quiz.options.join('\n'),
        answersText: quiz.answers.join(', '),
      },
    };
  }

  @Post('edit/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { question: string; options: string; answers: string; times: string },
    @Res() res: Response,
  ) {
    const options = body.options.split('\n').map((o) => o.trim()).filter(Boolean);
    const answers = body.answers.split(',').map((a) => parseInt(a.trim(), 10));
    const times = parseInt(body.times, 10) || 30;
    await this.quizService.update(parseInt(id, 10), { question: body.question, options, answers, times });
    res.redirect('/admin');
  }

  @Post('delete/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    await this.quizService.remove(parseInt(id, 10));
    res.redirect('/admin');
  }
}
