import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import Customer from "../entity/customer";
import CustomerFactory from "../factory/customer.factory";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "../events/customer-created.event";
import Address from "../value-object/address";

export default class CreateCustomerService {

  static execute(name: string, address: Address, eventDispatcher: EventDispatcher = new EventDispatcher()): Customer {
    const customer = CustomerFactory.create(name);
    customer.changeAddress(address);

    const repository = new CustomerRepository();
    repository.create(customer);

    eventDispatcher.notify(new CustomerCreatedEvent(customer));

    return customer;
  }
}