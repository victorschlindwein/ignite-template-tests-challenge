import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit statement", async () => {
    const user = await usersRepository.create({
      email: "rova@email.com",
      name: "rovarova",
      password:"pwd123",
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await usersRepository.create({
      email: "rova@email.com",
      name: "rovarova",
      password:"pwd123",
    });

    await createStatementUseCase.execute({
      amount: 101,
      description: "teste",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "teste",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create a withdraw statement with funds", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "rova@email.com",
        name: "rova",
        password:"pwd123",
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "teste",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement with a non-existent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "teste",
        type: OperationType.WITHDRAW,
        user_id: "nao-existe",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
