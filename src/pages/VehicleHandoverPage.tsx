import ComingSoon from "@/components/ComingSoon";

const VehicleHandoverPage = () => (
  <ComingSoon
    title="Vehicle Handover"
    description="The vehicle handover workflow is being finalized. You can still access bookings and returns while this page is prepared."
    planned={[
      "Hand over checklist and sign-off",
      "Condition photos and notes",
      "Assign handover to staff members",
      "Record odometer and fuel levels",
    ]}
  />
);

export default VehicleHandoverPage;
