// Simple placeholder auth. Replace with your real auth store.
export function useAuth() {
    const token = localStorage.getItem('token') || '';
    const meId = Number(localStorage.getItem('userId') || '0');
    return { token, meId };
}