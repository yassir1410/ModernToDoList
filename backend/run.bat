@echo off
echo Cleaning and building the project...
call mvn clean install
echo Starting the application...
call mvn spring-boot:run 