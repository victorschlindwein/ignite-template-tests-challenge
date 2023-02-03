import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a user", async () => {
    const response = await createUserUseCase.execute({
      name: "rovaris",
      email: "rova@email.com",
      password:"pwd123",
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create a duplicated user", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "rova1",
        email: "rova@email.com",
        password:"pwd123",
      });

      await createUserUseCase.execute({
        name: "rova2",
        email: "rova@email.com",
        password: "123pwd",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
