let faker = require("faker");
const generateEmployees = () => {
  let employees = [],
    groups = [];

  for (let id = 10000; id < 10010; id++) {
    let name;
    do {
      name = faker.name.jobType();
    } while (groups.map(g => g.name).indexOf(name) !== -1);
    groups.push({
      id,
      name,
      members: []
    });
  }

  for (let id = 0; id < 50; id++) {
    let name = faker.name.firstName() + " " + faker.name.lastName(),
      email = faker.internet.email(),
      address =
        faker.address.streetAddress() +
        ", " +
        faker.address.city() +
        ", " +
        faker.address.country(),
      phone = faker.phone.phoneNumber(),
      emp_groups = [];
    for (let i = 0; i < Math.floor(Math.random() * 3 + 1); i++) {
      let rg = Math.floor(Math.random() * 10 + 10000);
      if (emp_groups.indexOf(rg) === -1) {
        emp_groups.push(rg);
        groups[groups.map(group => group.id).indexOf(rg)].members.push(id);
      }
    }

    employees.push({
      id,
      name,
      email,
      address,
      phone,
      groups: emp_groups
    });
  }

  return { employees, groups };
};
module.exports = generateEmployees;
