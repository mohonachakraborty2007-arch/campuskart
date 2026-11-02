export function toPublicUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        department: user.department || null,
        year: user.year || null,
        createdAt: user.createdAt,
    };
}