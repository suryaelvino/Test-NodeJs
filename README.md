
# Nodejs Mongoose

## Installation

Install with npm

```bash
    cd Test-NodeJs
    npm install
```
Build docker
```bash
    docker build -t test-nodejs-app:1.0 .
```
Running docker
```bash
   docker run -p 3000:3000 -d test-nodejs-app:1.0
```
If mongodb not connected, you can restart and rebuild container
```bash
   docker-compose down
   docker-compose up --build
```