import { Controller, Get, Param, HttpException, HttpStatus, Delete, Post, Body, Put } from '@nestjs/common';
import { Lock} from './locker.dto';

@Controller('api/locker')
export class LockerController {

    private lockerObject: Lock[] = this.loadLockerFile()
    private nextIdBody: any = this.loadNextId()

    constructor() {
        this.lockerObject = this.loadLockerFile()
        this.nextIdBody = this.loadNextId()
    }

    @Get()
    getLockers() {
        return this.lockerObject
    }

    @Get(':id')
    getLocker(@Param('id') id: number) {
        for (const lock of this.lockerObject) {
            if(lock.Id == id) {
                return lock
            }
        }
        throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    }

    @Delete(':id')
    deleteLock(@Param('id') id: number) {
        for (let i = 0; i < this.lockerObject.length; i++) {
            const deletedLock = this.lockerObject[i];
            if(deletedLock.Id == id) {
                const index = this.lockerObject.indexOf(deletedLock)
                this.lockerObject.splice(index, 1);
                this.saveLockerFile()
                return deletedLock
            }
        }
        throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    }

    @Post()
    createLock(@Body() newLock: Lock) {

        for(const lock of this.lockerObject) {
            if (newLock.Project.toUpperCase() === lock.Project.toUpperCase() 
                && newLock.Filename.toUpperCase() === lock.Filename.toUpperCase()) {
                    throw new HttpException("File already locked", HttpStatus.FORBIDDEN)
            }
        }

        const lock = new Lock()
        lock.Filename = newLock.Filename
        lock.Project = newLock.Project
        lock.User = newLock.User
        lock.Id = this.consumeNextId()

        this.lockerObject.push(lock)

        this.saveLockerFile()

        return lock

    }

    @Put(':id')
    editLock(@Body() editedLock: Lock, @Param('id') id: number) {

        for(const lock of this.lockerObject) {
            if (editedLock.Project.toUpperCase() === lock.Project.toUpperCase() 
                && editedLock.Filename.toUpperCase() === lock.Filename.toUpperCase()) {
                    throw new HttpException("File already locked", HttpStatus.FORBIDDEN)
            }
        }

        for (const lock of this.lockerObject) {
            if (lock.Id == id) {
                lock.Filename = editedLock.Filename
                lock.Project = editedLock.Project
                lock.User = editedLock.User

                this.saveLockerFile()
                return lock
            }
        }
        throw new HttpException("Not found", HttpStatus.NOT_FOUND)
    }

    loadLockerFile() {
        const fs = require("fs")
        const rawData = fs.readFileSync("./data/locker.json")
        const LockerBody = JSON.parse(rawData)

        return LockerBody
    }

    saveLockerFile() { 
        var fs = require("fs")
        fs.writeFile("./data/locker.json", JSON.stringify(this.lockerObject), this.onSaveLockerFileComplete)
    }

    onSaveLockerFileComplete() {
        console.log("Save project file complete")
    }

    incrementNextId() {
        this.nextIdBody.nextLockId++;

        var fs = require("fs")
        fs.writeFile("./data/nextId.json", JSON.stringify(this.nextIdBody), this.onNextIdSaved)
    }

    onNextIdSaved() {
        console.log("Save nextId file complete")
    }

    consumeNextId() {
        const nextId = this.nextIdBody.nextLockId
        this.incrementNextId()

        return nextId
    }

    loadNextId() {
        const fs = require("fs")
        const rawData = fs.readFileSync("./data/nextId.json")
        const nextIdBody = JSON.parse(rawData) 

        return nextIdBody

    }
}
