<?php
   echo '<defs>
		<filter id="glow" x="-50%" y="-50%" height="200%" width="200%">
			<feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
			<feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
			<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
		</filter>
	</defs>';
?>