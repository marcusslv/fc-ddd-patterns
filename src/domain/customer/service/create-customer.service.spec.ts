import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import CreateCustomerService from "./create-customer.service";
import Address from "../value-object/address";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import EnviaConsoleLog1Handler from "../events/handler/envia-console-log1-handler";
import EnviaConsoleLog2Handler from "../events/handler/envia-console-log2-handler";
import { Sequelize } from "sequelize-typescript";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";

describe("Create customer service test", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
      sequelize = new Sequelize({
          dialect: "sqlite",
          storage: ":memory:",
          logging: false,
          sync: { force: true },
      });

      await sequelize.addModels([CustomerModel]);
      await sequelize.sync();
    });

    afterEach(async () => {
      await sequelize.close();
    });

  it("should create a customer", () => {
    const eventDispatcher = new EventDispatcher();

    const address = new Address("Street 1", 123, "12345-678", "City");
    const customer = CreateCustomerService.execute("Marcus", address, eventDispatcher);

    expect(customer).toBeDefined();
    expect(customer.id).toBeDefined();
    expect(customer.name).toBe("Marcus");
    expect(customer.Address).toBe(address);
  });

  it("should notify event when customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    const address = new Address("Street 1", 123, "12345-678", "City");
    CreateCustomerService.execute("Marcus", address, eventDispatcher);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });
});