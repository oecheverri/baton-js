import { Controller, Get, Req, Param, Post, Body, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { Request, raw, response } from 'express';
import { Project } from './project.create.dto'
import { create } from 'domain';

@Controller('api/project')
export class ProjectController {

    projectsObject: any;
    nextIdBody: any;

    constructor () {
        this.projectsObject = this.loadProjectsFile()
        this.nextIdBody = this.loadNextId()
    }

    @Get(':id')
    getProject(@Param('id') id: number) {
        for (const project of this.projectsObject) {
            if (project.Id == id) {
                return project
            }
        }
        throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    }

    @Get()
    getProjects() {
        return this.projectsObject
    }

    @Post()
    createProject(@Body() createProject: Project ) {

        const newProject = new Project()
        newProject.Id = this.consumeNextId()
        newProject.Name = createProject.Name
        newProject.SlackURL = createProject.SlackURL

        this.projectsObject.push(newProject)
        this.saveProjectsFile()

        return newProject
    }

    @Put(':id')
    editProject(@Body() project: Project, @Param('id') id: number) {
        for (const existingProject of this.projectsObject) {
    
            if (existingProject.Id == id) {
                existingProject.Name = project.Name
                existingProject.SlackURL = project.SlackURL
                this.saveProjectsFile()
                return ""
            }
        }
        throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    }

    @Delete(':id')
    deleteProject(@Param('id') id: number) {
        for(let i = 0 ; i < this.projectsObject.length; i++) {
            const project = this.projectsObject[i]
            if (project.Id == id) {
                const index = this.projectsObject.indexOf(project)
                this.projectsObject.splice(index, 1)
                return project
            }
        }
        throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    } 



    loadProjectsFile() {
        const fs = require("fs")
        const rawData = fs.readFileSync("./data/project.json")
        const projectsBody = JSON.parse(rawData)

        return projectsBody
    }

    saveProjectsFile() { 
        var fs = require("fs")
        fs.writeFile("./data/project.json", JSON.stringify(this.projectsObject), this.onSaveProjectsFileComplete)
    }

    onSaveProjectsFileComplete() {
        console.log("Save project file complete")
    }

    incrementNextId() {
        this.nextIdBody.nextProjectId++;

        var fs = require("fs")
        fs.writeFile("./data/nextId.json", JSON.stringify(this.nextIdBody), this.onNextIdSaved)
    }

    onNextIdSaved() {
        console.log("Save nextId file complete")
    }

    consumeNextId() {
        const nextId = this.nextIdBody.nextProjectId
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
