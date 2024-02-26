
async function loginUser(credentials: { email: string; password: string }) {
    try {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        })
            .then(data => data.json())
    } catch (error) {
        return new Error(`Error login user: ${error}`);
    }
}

const registerUser = async (user: any) => {
    try {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        })
            .then(data => data.json())
    } catch (error) {
        return new Error(`Error register user: ${error}`);
    }
}
export { loginUser, registerUser };
