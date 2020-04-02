import { Module } from '@nestjs/common';
import { ProjectController } from './project/project.controller';
import { LockerController } from './locker/locker.controller';

@Module({
  imports: [],
  controllers: [ProjectController, LockerController],
})
export class AppModule {}
