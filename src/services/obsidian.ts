import axios from 'axios';

const OBSIDIAN_API_URL = 'http://127.0.0.1:27123';
const API_KEY = '41ddc8efbb14552f1d96e5b186351b3a663265ea3e7854f09a95bc62b116cb3a'; // Твой ключ

export async function searchNotes(query: string) {
    try {
        const response = await axios.post(`${OBSIDIAN_API_URL}/search/`, {
            query: query
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка доступа к Obsidian:", error);
        return null;
    }
}