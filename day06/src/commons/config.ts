import * as path from 'path';
import { DataSourceType } from './dataSourceType';

export const DATA_PATH = path.join(__dirname, '../..', '/data/books.json');
export const USER_PATH = path.join(__dirname, '../..', '/data/users.json');

export const BOOKS_API_URL = 'https://your-api-domain.com/books';
export const USERS_API_URL = 'https://your-api-domain.com/users';


export const BOOKS_SOURCE_TYPE: DataSourceType = DataSourceType.JSON;
export const USERS_SOURCE_TYPE: DataSourceType = DataSourceType.JSON;
