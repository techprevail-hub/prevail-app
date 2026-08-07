// app/dashboard/seeker/nps-survey/layout.tsx

export default function NpsSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses any global invitation checks
  return <>{children}</>;
}