import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { Modal } from '#components/molecules/modal';
import './modal.css';

type ChatRole = 'system' | 'user';

interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
}

interface ActionAgentModalProps {
  onClose: (open: boolean) => void;
  /** Se llama con la instrucción escrita por el usuario (ya sin espacios sobrantes). */
  onSubmit?: (instruction: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 0, role: 'system', text: 'Escribe una instrucción para comenzar.' },
];

export const ActionAgentModal = ({ onClose, onSubmit }: ActionAgentModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [instruction, setInstruction] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Mantiene el log desplazado al último mensaje.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = instruction.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: prev.length, role: 'user', text }]);
    setInstruction('');
    onSubmit?.(text);
  };

  return (
    <Modal onClose={onClose}>
      <section className="actionChat" aria-label="Chat con el asistente">
        <div ref={logRef} className="actionChat__log" role="log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`actionChat__message actionChat__message--${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>

        <form className="actionChat__form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="actionChat__input"
            placeholder="Escribe una instrucción…"
            aria-label="Instrucción"
            autoComplete="off"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <button type="submit" className="actionChat__submit">
            Enviar
          </button>
        </form>
      </section>
    </Modal>
  );
};