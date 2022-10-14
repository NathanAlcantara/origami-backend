# Awesome Project Build with TypeORM + Graphql

## Setup your dev environment:

1. You need to create a `.env` file on the root of project with the database and redis information, like this:
    ```
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
    REDIS_URL=redis://localhost:6379
    NODE_ENV=development
    SESSION_SECRET=s3cr3t!
    ```
2. Install and configure [Docker](https://www.docker.com/get-started) for your operating system;
3. Install [VS Code](https://code.visualstudio.com) or [VS Code Insiders](https://code.visualstudio.com/insiders);
4. install the VS Code extension [Remote - Container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers);
5. Run **Remote-Containers: Reopen in container**;

Once inside container, the dependencies will be installed, the database will be ready to use and the migrations will run :tada:

Now you just type `yarn dev` on terminal and be happy coding :wink: