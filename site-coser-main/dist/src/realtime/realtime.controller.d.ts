import { Observable } from 'rxjs';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { RealtimeService } from './realtime.service';
interface MessageEvent {
    data: string;
    type?: string;
    id?: string;
}
export declare class RealtimeController {
    private readonly realtime;
    constructor(realtime: RealtimeService);
    stream(user: AuthUser): Observable<MessageEvent>;
    private isAllowed;
}
export {};
