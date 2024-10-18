import { db } from "./firebase.config";
import { collection, getDocs } from "firebase/firestore";

export default async function Home() {
	const plants = collection(db, "plants");
	const snapshot = await getDocs(plants);
	const plantsList = snapshot.docs.map((doc) => doc.data());

  return (
	<div>
		<h2>Plants</h2>
		{plantsList.map((plant) => (
			<div key={plant.id}>{plant.name}</div>
		))	}
	</div>
  );
}
