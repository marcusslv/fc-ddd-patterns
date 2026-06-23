import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
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
    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    const address = new Address("Street 1", 123, "12345-678", "City");
    const customer = CreateCustomerService.execute("Marcus", address);

    expect(customer).toBeDefined();
    expect(customer.id).toBeDefined();
    expect(customer.name).toBe("Marcus");
    expect(customer.Address).toBe(address);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(
      2
    );
    
  });
});