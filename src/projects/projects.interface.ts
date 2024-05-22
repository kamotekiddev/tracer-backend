import { Category, Issue, Project, User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        type: 'accessToken' | 'refreshToken';
        iat: number;
        exp: number;
    };
}

export type ProjectFilter = 'ALL' | 'MY_PROJECTS' | 'I_AM_MEMBER';

export interface CategoryWithIssues extends Category {
    issues: Issue[];
}

export interface ProjectListItem extends Project {
    categories: CategoryWithIssues[];
    members: User[];
    owner: User;
}
