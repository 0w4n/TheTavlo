import { type CreatePanelDTO, type Panel } from "./panel.entity";
export default class PanelRules {
    static validateName(name: string): string | null;
    static canDelete(panel: Panel): boolean;
    static getDefaultPanel(): CreatePanelDTO;
}
