<?php
   echo '<defs>
		<filter id="glow" x="-150%" y="-150%" height="300%" width="300%">
			<feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
			<feGaussianBlur result="blurOut" in="offOut" stdDeviation="5" />
			<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
		</filter>
	</defs>';
?>