import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import ChangeCustomerAddressService from "./change-customer-address.service";
import Address from "../value-object/address";
import { Sequelize } from 'sequelize-typescript';
import CustomerModel from '../../../infrastructure/customer/repository/sequelize/customer.model';
import CreateCustomerService from './create-customer.service';
import EventDispatcher from '../../@shared/event/event-dispatcher';
import EnviaConsoleLogHandler from '../events/handler/envia-console-log-handler';

describe("Change customer address service test", () => {
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


    it("should change the customer address", () => {
        const eventDispatcher = new EventDispatcher();
        const enviaConsoleLogHandler = new EnviaConsoleLogHandler();
        eventDispatcher.register("CustomerAddressChanged", enviaConsoleLogHandler);

        const address = new Address("Street 1", 123, "12345-678", "City");
        const customer = CreateCustomerService.execute("Marcus", address);

        const newAddress = new Address("Street 2", 456, "98765-432", "New City");
        ChangeCustomerAddressService.execute(customer, newAddress, eventDispatcher);

        expect(customer.Address).toBe(newAddress);
        expect(customer.Address.street).toBe("Street 2");
        expect(customer.Address.number).toBe(456);
        expect(customer.Address.zip).toBe("98765-432");
        expect(customer.Address.city).toBe("New City");
    });

    it("should notify the event handler when the customer address is changed", () => {
        const eventDispatcher = new EventDispatcher();
        const enviaConsoleLogHandler = new EnviaConsoleLogHandler();
        const spyEventHandler = jest.spyOn(enviaConsoleLogHandler, "handle");

        eventDispatcher.register("CustomerAddressChanged", enviaConsoleLogHandler);

        const address = new Address("Street 1", 123, "12345-678", "City");
        const customer = CreateCustomerService.execute("Marcus", address, eventDispatcher);

        const newAddress = new Address("Street 2", 456, "98765-432", "New City");
        ChangeCustomerAddressService.execute(customer, newAddress, eventDispatcher);

        expect(spyEventHandler).toHaveBeenCalled();
    });
});