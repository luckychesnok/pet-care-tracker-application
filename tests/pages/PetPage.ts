import { Page, Locator, expect } from '@playwright/test';

export class PetPage {
  readonly page: Page;
  readonly petNameInput: Locator;
  readonly vaccineInput: Locator;
  readonly dateInput: Locator;
  readonly submitButton: Locator;
  readonly vaccineListRow: Locator;

  async goto() {
    await this.page.goto('http://localhost:3000');
  }

  async addVaccine(petName: string, vaccineName: string) {
    if (await this.petNameInput.isVisible()) {
      await this.petNameInput.fill(petName);
    }
    if (await this.vaccineInput.isVisible()) {
      await this.vaccineInput.fill(vaccineName);
    }
    if (await this.dateInput.isVisible()) {
      await this.dateInput.fill(date);
    }
    if (await this.submitButton.isVisible()) {
      await this.submitButton.click();
    }
  }
}