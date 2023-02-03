import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate", async () => {
    await usersRepository.create({
      email: "rova@email.com",
      name: "rovaris",
      password: await hash("123", 8),
    });

    const response = await authenticateUserUseCase.execute({
      email: "rova@email.com",
      password:"123",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("user");
  });

  it("should not be able to authenticate with a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "nao@existo.com",
        password: "nao-existo",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with a wrong password", async () => {
    expect(async () => {
      await usersRepository.create({
        email: "rova@email.com",
        name: "teste",
        password: await hash("1234", 8),
      });

      await authenticateUserUseCase.execute({
        email: "rova@email.com",
        password: "wrong-password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with a wrong email", async () => {
    expect(async () => {
      await usersRepository.create({
        email: "rova@email.com",
        name: "rovarius",
        password: await hash("123", 8),
      });

      const response = await authenticateUserUseCase.execute({
        email: "nao@existo.com",
        password:"pwd123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
