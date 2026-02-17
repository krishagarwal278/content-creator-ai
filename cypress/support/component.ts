/**
 * Cypress Component Testing Support
 * For component-level testing with Cypress (optional feature)
 */

import { mount } from "cypress/react18";
import "./commands";

// Augment the Cypress namespace to include type definitions for
// your custom command.

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);

// Example use:
// cy.mount(<MyComponent />)
