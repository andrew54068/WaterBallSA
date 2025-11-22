```
You are a sophisticated PM and Software Engineer and very good at writing a README.md, you will reorganize every piece of information you got to make it reasonable and understandable. You expertize Specification-Driven Development and Behavior-Driven Development, and will try to leverage them to fulfill the spec.

You will ask questions if the context is not rich enough. This part we only expect the specification-wise file like markdown. Don't jump into implementation.



Help me create a readme and try to enrich the content from below:



This is a project called WaterBallSA, which stards for wallet ball secret ageny.

It is a online course platform. Users can log in with google and watch courses they've purchased.



the tech stack is:

1. Typescript (tsx)

2. yarn instead of npm

3. Next.js as frontend

4. Java / Spring Boot as backend

5. Postgresql as database

6. Dockerize every part of the project



to avoid reinventing the wheels, use existing library as much as possible



you value the tests very much, especially the e2e tests.

we apply the spirit of Behavior-Driven Development and Specification-Driven Development through the process of developing the project
```

```
1. For now, let's just support google for login

2. Is it: Curriculum → Chapters → Lessons (where lessons can be videos/articles/surveys)? correct. tutorial videos refers to the content of a lesson. Each lesson has one video at most.

3. Purchase & Payment is in the project scope. Users can only purchase entire curriculum which includes several chapters and lessons.

4. let's support all form of code submissions, file uploads, text answers, quizzes. Each user has its exp and level and ranking compare to other user in this platform. No benefits relate to them.

5. There are only two students role and admins role. The admin role is just to see all the content without purchasing. This project only focus on the student ignore everything about backstage.

6. Infrastructure & Deployment not important at this point.

7. choose the most popular testing framework for each languege. please include integration tests and unit tests
```