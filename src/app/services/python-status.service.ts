import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface PythonHealth {
  status: string;
  time: string;
}

export interface SchedulerStatus {
  last_run: string | null;
  jobs_ok: number;
  jobs_fail: number;
  last_error: string | null;
}

@Injectable({ providedIn: 'root' })
export class PythonStatusService {
  private baseUrl = `${environment.apiPython}`.replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  health(): Observable<PythonHealth> {
    return this.http.get<PythonHealth>(`${this.baseUrl}/health`);
  }

  schedulerStatus(): Observable<SchedulerStatus> {
    return this.http.get<SchedulerStatus>(`${this.baseUrl}/scheduler/status`);
  }
}
