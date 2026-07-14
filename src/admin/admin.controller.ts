import { Controller, Get, Post, Body, Param, Render, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { QuizService } from '../quiz/quiz.service.js';
import { ParticipantService } from '../participant/participant.service.js';
import { ParticipationService } from '../participation/participation.service.js';
import { SettingsService } from '../settings/settings.service.js';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly quizService: QuizService,
    private readonly participantService: ParticipantService,
    private readonly participationService: ParticipationService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  @Render('admin/index')
  async index(@Query('tab') tab?: string, @Query('filter') filter?: string) {
    const quizzes = await this.quizService.findAll();
    const participants = await this.participantService.findAll();
    const dailyQuota = await this.settingsService.getDailyQuota();

    let participations = filter === 'winners'
      ? await this.participationService.findWinners()
      : await this.participationService.findAll();

    const participantStats = participants.map((p) => ({
      ...p,
      answeredCount: p.answeredNumbers ? p.answeredNumbers.length : 0,
    }));

    return {
      quizzes,
      participants: participantStats,
      participations,
      dailyQuota,
      activeTab: tab || 'participants',
      filter: filter || 'all',
      totalParticipants: participants.length,
      totalParticipations: (await this.participationService.findAll()).length,
      totalWins: (await this.participationService.findWinners()).length,
      totalQuizzes: quizzes.length,
    };
  }

  @Get('participant/:id')
  @Render('admin/participant')
  async participantDetail(@Param('id') id: string) {
    const pid = parseInt(id, 10);
    const participant = await this.participantService.findOne(pid);
    if (!participant) return { error: 'Participant non trouvé' };
    const participations = await this.participationService.findByParticipant(pid);
    return { participant, participations };
  }

  @Post('settings')
  async updateSettings(
    @Body() body: { dailyQuota: string },
    @Res() res: Response,
  ) {
    const quota = parseInt(body.dailyQuota, 10);
    if (quota > 0) {
      await this.settingsService.set('dailyQuota', String(quota));
    }
    res.redirect('/admin?tab=settings');
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
    res.redirect('/admin?tab=quizzes');
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
    res.redirect('/admin?tab=quizzes');
  }

  @Post('delete/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    await this.quizService.remove(parseInt(id, 10));
    res.redirect('/admin?tab=quizzes');
  }
}
