import { Type, FunctionDeclaration } from "@google/genai";

export interface AgentAction<TArgs = any> {
  declaration: FunctionDeclaration;          // lo que ve Gemini
  requiresConfirmation: boolean;             // false para lecturas
  validate(args: unknown): TArgs;            // zod u otro validador
  preview(args: TArgs): ActionPreview;       // lo que ve el usuario
  execute(args: TArgs): Promise<unknown>;    // lo que hace la app
}

export interface ActionPreview {
  title: string;
  fields: { label: string; value: string }[];
}

class ActionRegistry {
  private actions = new Map<string, AgentAction>();
  register(a: AgentAction) { this.actions.set(a.declaration.name!, a); }
  get(name: string) { return this.actions.get(name); }
  declarations() { return [...this.actions.values()].map(a => a.declaration); }
}

export const registry = new ActionRegistry();