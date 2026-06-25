import Customer from "../entity/customer";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import Address from "../value-object/address";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerAddressChanged from "../events/customer-address-changed.event";

export default class ChangeCustomerAddressService {
  static execute(customer: Customer, address: Address, eventDispatcher: EventDispatcher = new EventDispatcher()): void {
    const repository = new CustomerRepository();
      
    customer.changeAddress(address);
    repository.update(customer);

    eventDispatcher.notify(new CustomerAddressChanged({
        id: customer.id,
        name: customer.name,
        address: customer.Address
    }));
  }
}