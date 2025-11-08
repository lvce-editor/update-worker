import * as I18NString from '@lvce-editor/i18n'

/**
 * @enum {string}
 */
const UiStrings = {
  DoYouWantToUpdate: 'Do you want to update to version {PH1}?',
  DoYouWantToRestart: 'The Update has been downloaded. Do you want to restart now?',
}

export const promptMessage = (version: string): string => {
  return I18NString.i18nString(UiStrings.DoYouWantToUpdate, { PH1: version })
}

export const promptRestart = (): string => {
  return I18NString.i18nString(UiStrings.DoYouWantToRestart)
}
