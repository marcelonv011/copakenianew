import React from "react";
import { useQuery } from "@tanstack/react-query";

import HeroBanner from "@/components/home/HeroBanner";
import UpcomingMatches from "@/components/home/UpcomingMatches";
import RecentResults from "@/components/home/RecentResults";
import SponsorsPreview from "@/components/home/SponsorsPreview";
import HomeFooter from "./../layouts/HomeFooter";

import {
  getUpcomingMatches,
  getFinishedMatches,
} from "@/services/matchService";

import { getSponsors } from "@/services/sponsorService";

export default function Home() {
  const { data: upcomingMatches = [] } = useQuery({
    queryKey: ["matches-upcoming"],
    queryFn: getUpcomingMatches,
  });

  const { data: finishedMatches = [] } = useQuery({
    queryKey: ["matches-finished"],
    queryFn: getFinishedMatches,
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ["sponsors-active"],
    queryFn: async () => {
      const data = await getSponsors();
      return data.filter((s) => s.active === true || s.active === undefined);
    },
  });

  return (
    <div>
      <HeroBanner />
      <UpcomingMatches matches={upcomingMatches} />
      <RecentResults matches={finishedMatches} />
      <SponsorsPreview sponsors={sponsors} />
      <HomeFooter />    
    </div>
  );
}