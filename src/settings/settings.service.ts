import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly repo: Repository<Settings>,
  ) {}

  async get(key: string, defaultValue: string): Promise<string> {
    const row = await this.repo.findOneBy({ key });
    return row ? row.value : defaultValue;
  }

  async set(key: string, value: string): Promise<void> {
    const existing = await this.repo.findOneBy({ key });
    if (existing) {
      existing.value = value;
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create({ key, value }));
    }
  }

  async getDailyQuota(): Promise<number> {
    const val = await this.get('dailyQuota', '3');
    return parseInt(val, 10);
  }
}
