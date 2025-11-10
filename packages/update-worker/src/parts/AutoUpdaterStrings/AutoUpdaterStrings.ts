import * as I18NString from '@lvce-editor/i18n'
import * as UiStrings from '../UiStrings/UiStrings.ts'

export const promptMessage = (version: string): string => {
  return I18NString.i18nString(UiStrings.DoYouWantToUpdate, { PH1: version })
}

export const promptRestart = (): string => {
  return I18NString.i18nString(UiStrings.DoYouWantToRestart)
}
