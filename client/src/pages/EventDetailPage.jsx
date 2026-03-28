import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as eventService from '../services/eventService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import TeamSection from '../components/TeamSection';
import ScoringCriteriaSection from '../components/ScoringCriteriaSection';
import InviteJudgeSection from '../components/InviteJudgeSection';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isJudge = user?.role === 'judge';
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await eventService.getEvent(id);
        setEvent(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Event not found');
        } else {
          setError('Failed to load event');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="bg-bg-surface border border-border-card rounded-md px-6 py-5 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-16 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-base text-text-secondary mb-4">{error}</p>
        <Link to="/">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {isAdmin && (
        <Link
          to="/"
          className="
            text-sm font-medium text-text-secondary
            hover:text-text-primary transition-colors duration-base
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
            rounded-sm inline-block mb-4
          "
        >
          &larr; Back to Events
        </Link>
      )}

      <div className="flex items-center gap-3 mb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          {event.name}
        </h1>
        <StatusBadge status={event.status} />
      </div>

      <div className="bg-bg-surface border border-border-card rounded-md px-6 py-5 shadow-sm">
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              Date
            </dt>
            <dd className="text-base text-text-secondary mt-1">
              {formattedDate}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              Time Limit
            </dt>
            <dd className="text-base text-text-secondary mt-1">
              {event.time_limit} minutes per demo
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              Description
            </dt>
            <dd className="text-base text-text-secondary mt-1">
              {event.description || (
                <span className="text-text-muted">No description</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <Link
            to={`/events/${id}/scoring-summary`}
            className="
              inline-block bg-accent text-white
              text-md font-medium tracking-tight
              px-6 py-[11px] rounded-sm
              transition-colors duration-base
              hover:opacity-90
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
            "
          >
            View Scoring Summary
          </Link>
        </div>
      )}

      {isAdmin && <InviteJudgeSection eventId={id} />}
      <TeamSection eventId={id} eventStatus={event.status} readOnly={!isAdmin} isJudge={isJudge} />
      {isAdmin && <ScoringCriteriaSection eventId={id} eventStatus={event.status} />}
    </div>
  );
}
